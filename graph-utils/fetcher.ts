import { gql, request } from 'graphql-request'
import { agentDetails, complainDetails } from '../agentdetails'
import express from 'express'
import axios from 'axios'
import cors from 'cors'

const url = 'https://api.studio.thegraph.com/query/97511/w8s/version/latest'
async function fetchSubgraphData(contractImage: string) {


    const query = gql`{
        attesteds(
          first: 5
          where: {uid: "${contractImage}"}
        ) {
          id
          recipient
          attester
          uid
        }
      }`

    const data = await request(url, query)
    let uid = data.attesteds[0].uid
    console.log(uid)

    const details = await agentDetails(uid)
    const deploys = details.deployments
    let  coverage = details.coverage
    let assertions = details.assertions

    coverage = (JSON.parse(JSON.parse(coverage)))
    assertions = (JSON.parse(JSON.parse(assertions)))

    console.log(coverage)
    console.log(assertions)

    let addresses = []

    for (let deploy of deploys) {
        addresses.push(deploy.address)
    }

    console.log(addresses)

    const complainQuery = gql`{
        attesteds(
            first: 5
            where: {recipient: "${addresses[0]}"}
        ) {
            id
            recipient
            attester
            uid
        }
    }`

    const complainData = await request(url, complainQuery)


    let complainUids = []
    for (let complain of complainData.attesteds) {
        complainUids.push(complain.uid)
    }

    let complains = []
    for (let uid of complainUids) {
        const complain = await complainDetails(uid)
        complains.push(complain)
    }

    return { coverage, assertions, addresses, complains }
}

// fetchSubgraphData('0xe3fc9d71f20e64b9c88a46b419401061642a0078a8a70fe7b3259646026b1933')

const app = express()
app.use(cors())
const port = 3000

app.get('/subgraph-data', async (req, res) => {
    const contractImage = req.query.contractImage as string
    if (!contractImage) {
        return res.status(400).send('contractImage query parameter is required')
    }

    try {
        const data = await fetchSubgraphData(contractImage)
        res.json(data)
    } catch (error) {
        console.error(error)
        res.status(500).send('An error occurred while fetching subgraph data')
    }
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})